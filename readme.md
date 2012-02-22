Project/Application/Web: mkapp
Architect: Riceball LEE
Version: 0.0.1
Language: Javascript, CSS
Background: node.js, handlebars, Markdown

Description: Toolkit for Rapid Application Prototype Design and Development.
The requirement file will include the Features, Views and Models.


#<:=Command:new:=>
  Arguments: 
    * Directory name(optional). 

  Feature: New Applicaion

    In Order to make a new exciting application
    As a developer
    I want to create a start-up project base on the application template.

    Scenario: create a new start-up application via applicaion name
      Given I have think over a new exciting applicaion's name called <jsRails>
      When I run jsRails on the shell with 'jsRails new jsRails'
      Then the new folder jsRails in the current directory will be created
        AND the start-up readme.md requirement file will be created in the jsRails directory. 
    Scenario: create a new start-up application requirement file in a directory
      Given: I've already created a directory named <jsRails>
        And My current directory is the <jsRails> now
      When I run jsRails on the shell with 'jsRails new'
      Then the start-up readme.md requirement file will be created in the current directory. 


#<:=Command:update:=>

  Arguments: 
    * Directory name or file name.(optional).
      * if this is a directory name then the default file name is readme.md in the directory.

  Feature: Update Applicaion

    In Order to make a new exciting application
    As a developer
    I want to update my project base on my application requirement writen in the readme.md.

    Scenario: update the project via a directory
      Given I have put my requirement in the <jsRails> directory, named readme.md
        And the readme.md content is in the <test/fixtures/readme.md> file
      When I run jsRails on the shell with 'jsRails update jsRails'
      Then the missing folders and files in the jsRails directory will be created
        And the folders and files is in the <test/fixtures/update> directory
    Scenario: update the project via a file
      Given I have put my requirement in the <jsRails> directory, named readme.md
        And the readme.md content is in the <test/fixtures/readme.md> file
      When I run jsRails on the shell with 'jsRails update jsRails/readme.md'
      Then the missing folders and files in the jsRails directory will be created
        And the folders and files is in the <test/fixtures/update> directory
    Scenario: update the project in the current directory
      Given I have put my requirement in the current directory(<jsRails>), named readme.md
        And the readme.md content is in the <test/fixtures/readme.md> file
      When I run jsRails on the shell with 'jsRails update' in the current directory
      Then the missing folders and files in the jsRails directory will be created
        And the folders and files is in the <test/fixtures/update> directory

it will generates folders:

      wiki/
      features/
      pages/css/
      pages/js/app/ - the container for all js and templates related to this Ember app
      pages/js/app/app.js - declaration of a global App object that extends Ember.Application
      pages/js/app/models/ - model classes that represent resources
      pages/js/app/views/       - view classes, organized in subfolders
      pages/js/app/controllers/ - controllers that manage resources and are bound to views
      pages/js/app/helpers/ - handlebars helpers
      pages/js/vendor/  -- third-party vendored libraries like ember.js
      pages/js/lib/  -- general customizations


# JsonML (Json Markup Language)
I do not like this. It's idiot format. but the Markdown-js uses this.


    <div class='main'>
      hi
      <div>world</div>
      <div>world2</div>
      guest.
    </div>


    ['div',
     {'class':'main'},
     [
       'hi',
       ['div','world'],
       ['div', world2],
       'guest.'
     ]
    ]



# Page:Markdown Extension Format

Usage: Manual

## Document Meta Information

Feature: Markdown/Document Meta

    In Order to keep the meta info of the requirement
    As a architect
    I want to write these information at the front of file via key/value pair.

    Scenario: add the project type and name meta information
      Given I decide write a jsRails command-line application 
      When I add and save the 'Application:jsRails' in the first line of the readme.md file
      Then this meta information will be in the meta object after running the Markdown parser.

The document meta information is on the top of file

    Key1:Value1
    Key2:value2

the following meta info will be supported:

* Project Type: the value is the project name.
  * Project
  * Application
  * Web
* Architect
* AUthor
* Version/Revision

## Writen Language

The Default is English. 
Other Language use the second file extesion name indication:

    index.cn.md

The keywords is always English, but it can be translated dynamically when show.

## Comments

### Comment Block

this must be no space before (<!-- -->)

    <!--
      this is a block Comment.
    -->

## the CSS Definitions

    <:-CSS:Filename.scss:->
        .ClassName
          Description: explain this item.
        #ID
          Description: explain this item.

## the Feature Definition

It will automatically create a feature file(features/Feature_Name.feature) in features dir if no FeatureFilename.
the space char will be replace with \_"

## the Description Definitions

    Description: explain the block
    RegExpress: ^\s*Description:()

## the Rails Block Definition

Use the Atx-style headers and with multi Block type supports.
Directly replace the atx-style header processing

    # BlockType:[Div.]CSS_ClassName[ CSS_ClassName...][(attribute_name=value)]
    # Feature:
    # Page:
    # Model:
    # Block:

JsonML:

    [
      'Block',
      {},
      []  //string or array.
    ]    

treat the indentation level as the block level and the rails block definition.

The Rails Block Definition Must be exists on the header of this block.
here is the RegExp :

    /^([ \t]*)(#{1,6})\s*((\w+):(?:(\w+)\.)?((?:\s*[#.]?\w+)+)(?:\((.+)\))?)\s*#*\s*(?:\n|$)/
    m[1] = the indentation level
    m[2] = The title level
    m[3] = the total title
    m[4] = BlockType
    m[5] = TagName(Optional)
    m[6] = ClassNames
    m[7] = AttributeNames

specially for the html block description, ok the html block called block, not specially now:

    <::[DIV.]CSS_Class_Name ClassName2[{attribute_name=value, ...}]::>
    [Description: explain the block]

two ":" chars at least。

the following line is the Description to explain the block, it's optional.

使用同等的空格缩进进行分层次
第一层次必须没有空格

另一形式：

     :(CSS_Class_Name[{attribute_name=value, ...}])[.DIV]

该形式(Format)必须用在多行块中

multi class names are seperated via the space(" ”) char.

### Sample

<pre>
<::ClassName1{ID="my_id", Name="my_name"}::>
  Description: this is a explain about this block.

  SomeInfo
  <::ClassName2::>
      Hi Another        :(Left)

      Jiki
      Pig
      New anoymous Div  :(-)

      OK Adffg          :(Right).span
</pre>


the output：

<pre>
<!-- this is a explain about this block. -->
<div class="ClassName1" ID="my_id", Name="my_name">
  SomeInfo
  <div class="ClassName2">
    <div class="Left">
      Hi Another Jiki Pig
      <div>New anoymous Div</div>
    </div>
    <span class="Right">OK Adffg</span>
  </div>
</div>
</pre>

### the View(Page) Block Definition

    <:-Page:Name:->
    URL: XX
    File: XX
    CSS: the reference css files.
    Scripts: the reference script files.
    Feature: Feature name[:(FeatureFilename)]
      feature desc following the [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).

the Action(URL), File, CSS and Scripts all are optional.

## Reference Block

    %{Block_id}

### Examples


<pre>

<::::::Header{id:'my_block_id'}::::::>
  ## Site Title   :(Left Title)
  <:Right TopNavBar Vert):>
    Signup  :(Link)
    Explore :(Link)

%{my_block_id}

</pre>

## Include Other File

    %{file:Filename[.md]}



