// Released under MIT license
// Base on the Maruku dialects.
// Copyright (c) 2012 Riceball LEE(riceballl@hotmail.com)

(function() {

var Markdown = markdown.Markdown;
var mk_block = Markdown.mk_block;

/**
 * The Rails Markdown dialect to extend the Markdown format.
 *
 * 
**/
Markdown.dialects.RailsApp = Markdown.subclassDialect( Markdown.dialects.Gruber );

Markdown.dialects.RailsApp.block.document_meta = function document_meta( block, next ) {
  // we're only interested in the first block
  if ( block.lineNumber > 1 ) return undefined;

  // document_meta blocks consist of one or more lines of `Key: Value\n`
  if ( ! block.match( /^(?:\w+:.*\n)*\w+:.*$/ ) ) return undefined;

  // make an attribute node if it doesn't exist
  if ( !extract_attr( this.tree ) ) {
    this.tree.splice( 1, 0, {} );
  }

  var pairs = block.split( /\n/ );
  for ( p in pairs ) {
    var m = pairs[ p ].match( /(\w+):\s*(.*)$/ ),
        key = m[ 1 ].toLowerCase(),
        value = m[ 2 ];

    this.tree[ 1 ][ key ] = value;
  }

  // document_meta produces no content!
  return [];
};

    var indent_re = /^([ \t]*)/;
    var rails_block_re = /^([ \t]*)(#{1,6})[ \t]*((\w+):(?:(\w+)\.)?((?:[ \t]*[#.]?\w+)+)(?:\((.+)\))?)[ \t]*#*[ \t]*(?:\n|$)/;
    // stack of rails block for nesting.
    //   [{block:aRailsBlock, depth: number}]
    var stack = [];

    function expandTab(input) {
        return input.replace( / {0,1}\t/g, "  " );
    }

    function getDepthByBlanks(aBlanks) {
        return Math.floor(expandTab(aBlanks).length/2)+1;
    }

// the Rails Block has Feature, Model and View/Page Block.
Markdown.dialects.RailsApp.block.rails_block =  (function( ) {


    function newRailsBlock(aBlockType, aAttributes, aBlock, aDepth) {
        var result = [aBlockType, aAttributes];
        if (aBlock) result.push(aBlock);
        stack.push({block: result, depth: aDepth});
        return result;
    }

    function processRailsBlockLeft(aBlockStr, aNext, aLastDepth) {
        var m = aBlockStr.match( indent_re );
        var vDepth = 0;
        if (m) vDepth = getDepthByBlanks(m[1]);
        var vNewLine;
        var vLines = aBlockStr.split(/(?=\n)/);
        var vLine;
        var vIndentRegexp = new RegExp("^(?: {0,1}\\t| {2}){0," + aLastDepth + "}[ ]{0,2}");
        aBlockStr = '';
        //remove the indent spaces and processInline.
        for (var line_no=0; line_no < vLines.length;line_no++) {
            vLine = vLines[line_no];
            vNewLine = '';
            vLine = vLine.replace(/^\n/, function(n) { vNewLine = n; return ""; });
            vLine = vLine.replace(vIndentRegexp, "");
            vLine = this.processInline(vLine);
            aBlockStr += vNewLine + vLine;
        }
        return aBlockStr;
    }

    function processRailsBlock(aBlock, aNext, m, aParentDepth, aParentRailsBlock) {
          //var m = aBlock.match( rails_block_re );

          //if (!m) return undefined;
          

          var vTitle = m[3];
          var vHeaderLevel = m[2].length;
          var vCurrentDepth = 0;
          var i;
          if (m[1]) {
              vCurrentDepth = getDepthByBlanks(m[1]);
          }

          if (!vCurrentDepth && aParentRailsBlock) {
              aNext.unshift(aBlock);
              return undefined;
          }

          if (stack.length && vCurrentDepth < aParentDepth) {  //find proper parent of RailsBlock in stack, else the aParentRailsBlock is parent
              var found = stack.some(function (item, index) { 
                  if (vCurrentDepth-1 != item.depth) return false;
                  aParentRailsBlock = item.block;
                  aParentDepth = vCurrentDepth;
                  this.splice(index+1); //remove all the others after this item from stack.
                  //console.log('found');
                  //return true to stop searching.
                  return true;
              });
          }
          var vBlockType = m[4].toLowerCase();

          var vTagName = 'div';
          if (m[5]) vTagName = m[5];
          var vClassNames = m[6];
          var vAttributes = vClassNames;
          if (m[7]) vAttributes += ' ' + m[7];
          vAttributes = process_meta_hash(vAttributes, vTagName);

          var result = newRailsBlock(vBlockType, vAttributes, undefined, vCurrentDepth);
           // now get the content in the aBlock:
          if (m[0].length < aBlock.length) {
              // it's string for getting rid of the title.
              aBlock = mk_block( aBlock.substr( m[0].length ), aBlock.trailing, aBlock.lineNumber + 2 );
              aBlock = processRailsBlockLeft.apply(this, [aBlock, aNext, vCurrentDepth]);
              result.pushBlock(aBlock);
              aBlock = [];
          }
          if (aNext.length) {  //check the next block...
             //test the next block whether be is an indent rails block. 
              m = aNext[0].match(rails_block_re);
              var vNextDepth = 0;
              if (m) { //has indented
                vNextDepth = getDepthByBlanks(m[1]);

                if (vNextDepth >= vCurrentDepth) {
                  aBlock = aNext.shift();
                  aBlock = processRailsBlock.apply(this, [aBlock, aNext, m, vCurrentDepth, result]);
                  if (aBlock && aBlock.length) result.pushBlock(aBlock);
                }
              }
          }

          //if (aParentRailsBlock) {
          //    aParentRailsBlock.pushBlock(result);
          //}

          var header = [ "header", { level: vHeaderLevel } ];
          Array.prototype.push.apply(header, this.processInline(vTitle));

          //if (next.length)

          // insert the left string in the block if any as the new block into next array header. 
          //if ( m[0].length < block.length )
            //next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );

          return [ header, result ];
    }


    return function( block, next ) {
        var m = block.match( rails_block_re );

        if (!m) return undefined;

        var result = processRailsBlock.apply(this, [block, next, m]);
        stack = [];
        return result;
    };

})();

Markdown.dialects.RailsApp.block.block_meta = function block_meta( block, next ) {
  // check if the last line of the block is an meta hash
  // :(meta info for the block)[.DIV] at least 4 spaces or 1 tabs
  // Special for setextHeader: "Header\t\:(ClassName)\n==========\n":
  //   \n[-=]\2\2+(?:\n|$)
  //   m[1]: the spaces chars at least 4 or 1 tab char
  //   m[2]: attributes
  //   m[3]: tag name
  var m = block.match( /(\t+| {4,}):\(\s*((?:\\\)|[^\)])*)\s*\)(?:\.(\w+))? *(?:$|\n[-=]{3,}(?:\n|$))/ );
  if ( !m ) return undefined;

  // process the meta hash
  var attr = process_meta_hash( m[2], m[3] );
  var hash = null;

  // if we matched ^ then we need to apply meta to the previous block
  if ( m[ 1 ] === "" ) {
    var node = this.tree[ this.tree.length - 1 ];
    hash = extract_attr( node );

    // if the node is a string (rather than JsonML), bail
    if ( typeof node === "string" ) return undefined;

    // create the attribute hash if it doesn't exist
    if ( !hash ) {
      hash = {};
      node.splice( 1, 0, hash );
    }

    // add the attributes in
    for ( a in attr ) {
      hash[ a ] = attr[ a ];
    }

    // return nothing so the meta hash is removed
    return [];
  }

  // pull the meta hash off the block and process what's left
  //var b = block.replace( /\n.*$/, "" );
  //var b = block.substring(0, m.index);
  var b= block.replace(/(\t+| {4,}):\(\s*((?:\\\)|[^\)])*)\s*\)(\.\w+)?\s*/, "");

  var result = this.processBlock( b, [] );

  // get or make the attributes hash
  hash = extract_attr( result[ 0 ] );
  if ( !hash ) {
    hash = {};
    result[ 0 ].splice( 1, 0, hash );
  }

  // attach the attributes to the block
  for ( a in attr ) {
    hash[ a ] = attr[ a ];
  }

  return result;
};

Markdown.dialects.RailsApp.block.definition_list = function definition_list( block, next ) {
  // one or more terms followed by one or more definitions, in a single block
  var tight = /^((?:[^\s:].*\n)+):\s+([^]+)$/,
      list = [ "dl" ];
  var i;

  // see if we're dealing with a tight or loose block
  if ( ( m = block.match( tight ) ) ) {
    // pull subsequent tight DL blocks out of `next`
    var blocks = [ block ];
    while ( next.length && tight.exec( next[ 0 ] ) ) {
      blocks.push( next.shift() );
    }

    for ( var b = 0; b < blocks.length; ++b ) {
      var m = blocks[ b ].match( tight ),
          terms = m[ 1 ].replace( /\n$/, "" ).split( /\n/ ),
          defns = m[ 2 ].split( /\n:\s+/ );

      // print( uneval( m ) );

      for ( i = 0; i < terms.length; ++i ) {
        list.push( [ "dt", terms[ i ] ] );
      }

      for ( i = 0; i < defns.length; ++i ) {
        // run inline processing over the definition
        list.push( [ "dd" ].concat( this.processInline( defns[ i ].replace( /(\n)\s+/, "$1" ) ) ) );
      }
    }
  }
  else {
    return undefined;
  }

  return [ list ];
};

Markdown.dialects.RailsApp.inline[ ":(" ] = function inline_meta( text, matches, out ) {
  console.log('matches', matches);
  if ( !out.length ) {
    return [ 2, ":(" ];
  }

  // get the preceeding element
  var before = out[ out.length - 1 ];

  if ( typeof before === "string" ) {
    before = out;
    //return [ 2, ":(" ];
  }

  // match a meta hash
  var m = text.match( /^:\(\s*((?:\\\)|[^\)])*)\s*\)/ );

  // no match, false alarm
  if ( !m ) {
    return [ 2, ":(" ];
  }

  // attach the attributes to the preceeding element
  var meta = process_meta_hash( m[ 1 ] ),
      attr = extract_attr( before );

  if ( !attr ) {
    attr = {};
    before.splice( 1, 0, attr );
  }

  for ( var k in meta ) {
    attr[ k ] = meta[ k ];
  }

  // cut out the string and replace it with nothing
  return [ m[ 0 ].length, "" ];
};

Markdown.buildBlockOrder ( Markdown.dialects.RailsApp.block );
Markdown.buildInlinePatterns( Markdown.dialects.RailsApp.inline );

var isArray = function(obj) {
    return (obj instanceof Array || typeof obj === "array" || Array.isArray(obj));
};

function extract_attr( jsonml ) {
  return isArray(jsonml)
      && jsonml.length > 1
      && typeof jsonml[ 1 ] === "object"
      && !( isArray(jsonml[ 1 ]) )
      ? jsonml[ 1 ]
      : undefined;
}

function process_meta_hash( meta_string, tag_string ) {
  var meta = split_meta_hash( meta_string ),
      attr = {};

  for ( var i = 0; i < meta.length; ++i ) {
    // id: #foo
    if ( /^#/.test( meta[ i ] ) ) {
      attr.id = meta[ i ].substring( 1 );
    }
    // class: .foo
    else if ( /^\./.test( meta[ i ] ) ) {
      // if class already exists, append the new one
      if ( attr['class'] ) {
        attr['class'] = attr['class'] + meta[ i ].replace( /./, " " );
      }
      else {
        attr['class'] = meta[ i ].substring( 1 );
      }
    }
    // attribute: foo=bar
    else if ( /\=/.test( meta[ i ] ) ) {
      var s = meta[ i ].split( /\=/ );
      attr[ s[ 0 ] ] = s[ 1 ];
    }
    // class: foo
    else if ( /^[^\=]/.test( meta[ i ] ) ) {
      // if class already exists, append the new one
      if ( attr['class'] ) {
        attr['class'] = attr['class'] + ' ' + meta[ i ];
      }
      else {
        attr['class'] = meta[ i ];
      }
    }

    if (tag_string && tag_string !== '') {
        attr['tag'] = tag_string;
    }

  }

  return attr;
}

function split_meta_hash( meta_string ) {
  var meta = meta_string.split( "" ),
      parts = [ "" ],
      in_quotes = false;

  while ( meta.length ) {
    var letter = meta.shift();
    switch ( letter ) {
      case " " : 
      case "," :
        // if we're in a quoted section, keep it
        if ( in_quotes ) {
          parts[ parts.length - 1 ] += letter;
        }
        // otherwise make a new part
        else {
          parts.push( "" );
        }
        break;
      case "'" :
      case '"' :
        // reverse the quotes and move straight on
        in_quotes = !in_quotes;
        break;
      case "\\" :
        // shift off the next letter to be used straight away.
        // it was escaped so we'll keep it whatever it is
        letter = meta.shift();
      default :
        parts[ parts.length - 1 ] += letter;
        break;
    }
  }

  return parts;
}

//TODO: stack.some or using some library to do so.
//  callback(item, index, this_array)
if (!Array.prototype.some)
    Array.prototype.some = function (callback, thisObject) {
        var result = false;
        var array = this;
        if (!thisObject) thisObject = this;
        if (array.length) {
          var found;
          for (var i=array.length-1; i>=0; i--) {
              var item = array[i];
              //found = (item == true);
              //if (found)
                found = callback.apply(thisObject, [array[i], i]);
              if (found) {
                  result = true;
                  break;
              }
          }
        }
        return result;
    };

//TODO: not pretty way.
Array.prototype.pushBlock = function (aBlock) {
    var element;
    if (this.length < 1) return false; //invalid jsonML array format.
    this.push(aBlock);
    return true;
};
Array.prototype.blockToStr = function (aBlock) {
    var result;
    if (aBlock instanceof Array) {
        if ((this.length == 3) || (this.length == 2 && (this[1] instanceof String || this[1] instanceof Array))) {
            result = this[this.length-1].toString();
        }
    } else if (aBlock instanceof String) {
        result = aBlock;
    }
    return result;
};

})();

