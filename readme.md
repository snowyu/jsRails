Project/Application/Web: mkapp
Architect: Riceball LEE
Version: 0.0.1
Requirements: javascript, handlebars, Markdown

Description: Toolkit for Rapid Application Prototype Design and Development.
The requirement file will include the Features, Views and Models.


<:=Command:new:=>
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


<:=Command:update:=>

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



<:=Page:Markdown Extension Format=:>

Usage: Manual

# Document Meta Information

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

# Language

The Default is English. 
Other Language use the second file extesion name indication:

    index.cn.md

The keywords is always English, but it can be translated dynamically when show.

# Comments

## Comment Block

this must be no space before (<!-- -->)

    <!--
      this is a block Comment.
    -->

# the CSS Definitions

    <:-CSS:Filename.scss:->
        .ClassName
          Description: explain this item.
        #ID
          Description: explain this item.

# the Feature Definition

It will automatically create a feature file(features/Feature_Name.feature) in features dir if no FeatureFilename.
自动文件名会将空格替换为"\_"

# the Description Definitions

    Description: explain the block
    RegExpress: ^\s*Description:()



# the Rails Block Definition

使用"<::::>"将块的信息扩住

    <::[BlockType:][DIV.]CSS_Class_Name ClassName2[{attribute_name=value, ...}]::>
    [Description: explain the block]

至少两个":"冒号。

the following line is the Description to explain the block, it's optional.

使用同等的空格缩进进行分层次
第一层次必须没有空格

另一形式：

     :(CSS_Class_Name[{attribute_name=value, ...}])[.DIV]

该形式(Format)必须用在多行块中

可以有多个类名，用“ ”空格分隔

## 例子

<pre>
<::ClassName1{ID="my_id", Name="my_name"}::>
  Description: this is a explain about this block.

  SomeInfo
  <::ClassName2::>
      Hi Another        :(Left)

      Jiki
      Pig
      New anoymous Div  :(-)

      OK Adffg          :(Right)
</pre>


对应的Div为：

<pre>
<!-- this is a explain about this block. -->
<div class="ClassName1" ID="my_id", Name="my_name">
  SomeInfo
  <div class="ClassName2">
    <div class="Left">
      Hi Another Jiki Pig
      <div>New anoymous Div</div>
    </div>
    <div class="Right">OK Adffg</div>
  </div>
</div>
</pre>

## the View(Page) Block Definition

    <:-Page:Name:->
    URL: XX
    File: XX
    CSS: the reference css files.
    Scripts: the reference script files.
    Feature: Feature name[:(FeatureFilename)]
      feature desc following the [Gherkin](https://github.com/cucumber/cucumber/wiki/Gherkin).

the Action(URL), File, CSS and Scripts all are optional.

# Reference Block

    %{Block_id}

## Examples


<pre>

<::::::Header{id:'my_block_id'}::::::>
  ## Site Title   :(Left Title)
  <:Right TopNavBar Vert):>
    Signup  :(Link)
    Explore :(Link)

%{my_block_id}

</pre>

# Include Other File

    %{file:Filename[.md]}



